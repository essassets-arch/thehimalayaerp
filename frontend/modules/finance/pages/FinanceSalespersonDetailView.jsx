'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, UserCheck, Mail, Phone, Building, Calendar, ShieldCheck,
  TrendingUp, DollarSign, Wallet, Activity, CheckCircle2, Clock, AlertTriangle,
  FileText, Box, RefreshCw, MessageSquare, Layers, Award
} from 'lucide-react';
import { financeSalesAnalyticsService } from '../../../services/financeSalesAnalytics.service';

export default function FinanceSalespersonDetailView({ salespersonId, onBack }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const formatLakh = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    if (!salespersonId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detRes, timeRes] = await Promise.all([
          financeSalesAnalyticsService.getSalespersonDetail(salespersonId),
          financeSalesAnalyticsService.getSalespersonTimeline(salespersonId),
        ]);

        const detObj = detRes?.data || detRes;
        if (detObj) setDetailData(detObj);

        const timeList = timeRes?.data?.timeline || timeRes?.timeline;
        if (timeList) setTimeline(timeList);
      } catch (err) {
        console.error('Failed to load salesperson detail:', err);
        setError(err.message || 'Failed to load salesperson profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [salespersonId]);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw className="spin" size={28} style={{ marginBottom: '12px', color: '#0EA5E9' }} />
        <div style={{ fontWeight: '700', fontSize: '15px' }}>Loading Salesperson Profile & Timeline...</div>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
        <AlertTriangle size={32} color="#EF4444" style={{ marginBottom: '8px' }} />
        <h4 style={{ color: '#991B1B', fontWeight: '800' }}>Unable to load profile</h4>
        <p style={{ color: '#7F1D1D', fontSize: '13px', marginTop: '4px' }}>{error}</p>
        <button
          onClick={onBack}
          style={{ marginTop: '16px', padding: '8px 16px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
        >
          Back to List
        </button>
      </div>
    );
  }

  const { profile, kpis, customers } = detailData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Back Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '13px',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Salespersons</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            background: profile.isActive ? '#DCFCE7' : '#FEE2E2',
            color: profile.isActive ? '#15803D' : '#B91C1C'
          }}>
            {profile.isActive ? 'Active Salesperson' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Salesperson Profile Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '26px'
        }}>
          {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{profile.name}</h2>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', color: '#64748B', fontSize: '13px', flexWrap: 'wrap' }}>
            <span><strong>ID:</strong> {profile.employeeId}</span>
            <span>•</span>
            <span><strong>Role:</strong> {profile.designation}</span>
            <span>•</span>
            <span><strong>Branch:</strong> {profile.branch}</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: '#475569', fontSize: '13px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#0EA5E9" /> {profile.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={14} color="#0EA5E9" /> Team: {profile.team}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserCheck size={14} color="#0EA5E9" /> Manager: {profile.reportingManager}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Confirmed Sales</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{formatLakh(kpis.confirmedSalesValue)}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{kpis.ordersGenerated || 0} Orders</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Collected Amount</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563EB', marginTop: '4px' }}>{formatLakh(kpis.collectedAmount)}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Efficiency: {kpis.collectionEfficiency || 0}%</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Outstanding Receivable</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>{formatLakh(kpis.outstandingAmount)}</div>
          <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px' }}>Overdue: {formatLakh(kpis.overdueAmount)}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Leads & Conversion</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{kpis.totalLeads || 0}</div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>Lead Conv: {kpis.leadToQuotationRate || 0}%</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Quotations Value</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#7C3AED', marginTop: '4px' }}>{formatLakh(kpis.quotationValue)}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Accepted: {kpis.quotationsAccepted || 0}</div>
        </div>
      </div>

      {/* Two Column Layout: Timeline vs Customers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Activity Timeline */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#0EA5E9" />
            <span>Chronological Activity Timeline</span>
          </h3>

          {timeline.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No recorded activities found for this salesperson.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
              {timeline.map((item) => (
                <div key={item.id} style={{
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  borderLeft: '4px solid #0EA5E9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    <span>{item.type}</span>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: '600' }}>
                    {item.entity}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {item.notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Accounts Breakdown */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="#0EA5E9" />
            <span>Top Assigned Customer Accounts</span>
          </h3>

          {customers.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No customer accounts assigned yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customers.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{c.companyName}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Contact: {c.contactPerson}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#059669' }}>{formatLakh(c.totalSales)}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{c.totalOrders} Orders</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
