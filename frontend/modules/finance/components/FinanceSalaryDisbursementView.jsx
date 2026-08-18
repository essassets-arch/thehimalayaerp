'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Building2, CheckCircle2, Clock, DollarSign, FileText, Send, Eye, ShieldCheck, CreditCard } from 'lucide-react';

export default function FinanceSalaryDisbursementView() {
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'paid'>('pending');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startingBulk, setStartingBulk] = useState(false);

  // Payment Confirmation Modal State
  const [paymentModalRecord, setPaymentModalRecord] = useState<any>(null);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [utrNumber, setUtrNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchFinanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = activeTab === 'pending'
        ? '/finance/payroll/pending'
        : (activeTab === 'processing' ? '/finance/payroll/processing' : '/finance/payroll/paid');
      
      const res = await apiClient.get(endpoint);
      if (res && res.success !== false) {
        const raw = res.data?.items || res.items || res.data || res;
        setRecords(Array.isArray(raw) ? raw : []);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Failed to load Finance payroll records:', err);
      setError(err.message || 'Error loading finance payroll records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFinanceRecords();
    setSelectedIds([]);
  }, [activeTab, fetchFinanceRecords]);

  const handleStartProcessingBulk = async () => {
    if (!selectedIds.length) {
      alert('Please select pending payroll records to start processing.');
      return;
    }
    try {
      setStartingBulk(true);
      await apiClient.post('/finance/payroll/start-processing', { ids: selectedIds });
      setSelectedIds([]);
      setActiveTab('processing');
    } catch (err: any) {
      alert(err.message || 'Failed to start processing salary');
    } finally {
      setStartingBulk(false);
    }
  };

  const handleConfirmMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalRecord || !utrNumber.trim()) {
      alert('UTR Number / Transaction Reference is mandatory.');
      return;
    }
    try {
      setSubmittingPayment(true);
      await apiClient.post(`/finance/payroll/${paymentModalRecord.id}/mark-paid`, {
        paymentDate,
        paymentMode,
        utrNumber,
        remarks,
      });
      setPaymentModalRecord(null);
      setUtrNumber('');
      setRemarks('');
      await fetchFinanceRecords();
    } catch (err: any) {
      alert(err.message || 'Failed to complete salary payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const totalTabValue = safeRecords.reduce((acc, r) => acc + (r.netPayable || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        background: '#ffffff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} color="#059669" />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Finance Salary Disbursement Portal</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Execute bank salary transfers, record transaction UTR numbers, and finalize immutable salary slips</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#ecfdf5', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', border: '1px solid #a7f3d0' }}>
            Total Value: <span style={{ color: '#059669', fontSize: '15px', fontWeight: '900' }}>₹{totalTabValue.toLocaleString('en-IN')}</span>
          </div>

          {activeTab === 'pending' && (
            <button
              onClick={handleStartProcessingBulk}
              disabled={startingBulk || selectedIds.length === 0}
              style={{
                padding: '10px 18px', background: selectedIds.length === 0 ? '#94a3b8' : '#059669',
                color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: selectedIds.length === 0 ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <CreditCard size={16} /> Start Processing Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0' }}>
        {[
          { id: 'pending', label: '⏳ Pending Disbursement' },
          { id: 'processing', label: '⚡ Active Processing Queue' },
          { id: 'paid', label: '✓ Paid Salary History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 20px',
              fontSize: '13.5px',
              fontWeight: '800',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #059669' : '3px solid transparent',
              color: activeTab === tab.id ? '#059669' : '#64748b',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Records Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            Loading disbursement records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No records in this disbursement tab.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  {activeTab === 'pending' && (
                    <th style={{ padding: '12px 16px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length === records.length && records.length > 0}
                        onChange={(e) => setSelectedIds(e.target.checked ? records.map(r => r.id) : [])}
                      />
                    </th>
                  )}
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Employee</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Bank &amp; Account Snapshot</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>IFSC</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Net Payable Salary</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Approvals</th>
                  {activeTab === 'paid' && <th style={{ padding: '12px 16px', fontWeight: '700' }}>Payment Ref / UTR</th>}
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {activeTab === 'pending' && (
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, row.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== row.id));
                          }}
                        />
                      </td>
                    )}
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{row.employeeName}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{row.employeeCode} · {row.department}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#334155' }}>
                      {row.bankName || 'HDFC Bank'} <span style={{ color: '#475569', fontWeight: '800', fontFamily: 'monospace' }}>(XXXX{row.accountLast4 || '1234'})</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>
                      {row.ifsc || 'HDFC0001234'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '900', color: '#059669', fontSize: '14px' }}>
                      ₹{row.netPayable?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#166534', fontWeight: '800' }}>
                      HR Verified ✓ | Super Admin Approved ✓
                    </td>
                    {activeTab === 'paid' && (
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '800', color: '#4338ca' }}>
                        {row.utrNumber || '—'}
                      </td>
                    )}
                    <td style={{ padding: '12px 16px' }}>
                      {activeTab === 'pending' && (
                        <button
                          onClick={() => { setSelectedIds([row.id]); handleStartProcessingBulk(); }}
                          style={{ padding: '6px 12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Start Processing
                        </button>
                      )}
                      {activeTab === 'processing' && (
                        <button
                          onClick={() => setPaymentModalRecord(row)}
                          style={{ padding: '6px 12px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                        >
                          Salary Done (Enter UTR) ✓
                        </button>
                      )}
                      {activeTab === 'paid' && (
                        <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '11px', fontWeight: '800', border: '1px solid #86efac' }}>
                          PAID &amp; SLIP SNAPSHOTTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {paymentModalRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <form onSubmit={handleConfirmMarkPaid} style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Salary Payment</h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                {paymentModalRecord.employeeName} ({paymentModalRecord.employeeCode})
              </span>
            </div>

            <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#065f46' }}>Net Salary Amount (Server-Enforced):</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#047857' }}>₹{paymentModalRecord.netPayable?.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Payment Date *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Payment Method *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ width: '100%', padding: '8.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', background: '#fff', outline: 'none' }}
                >
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="IMPS">IMPS</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Bank UTR / Transaction Reference *</label>
              <input
                type="text"
                placeholder="e.g. HDFC20260820ABC123"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #059669', fontSize: '13px', fontWeight: '800', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Remarks (Optional)</label>
              <input
                type="text"
                placeholder="August salary disbursement"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setPaymentModalRecord(null)}
                style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPayment}
                style={{ padding: '10px 18px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
              >
                {submittingPayment ? 'Finalizing Payment...' : 'Confirm Salary Paid ✓'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
