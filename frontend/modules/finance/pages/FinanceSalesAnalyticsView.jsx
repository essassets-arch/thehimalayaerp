'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TrendingUp, BarChart3, Users, DollarSign, Wallet, Activity, Percent,
  RefreshCw, Download, Filter, Search, ChevronRight, CheckCircle2, Clock,
  AlertTriangle, RotateCcw, FileText, Box, Layers, UserCheck, Award, MessageSquare,
  FlaskConical, ArrowRight, Building
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { financeSalesAnalyticsService } from '../../../services/financeSalesAnalytics.service';
import FinanceSalespersonDetailView from './FinanceSalespersonDetailView';

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'salespersons', label: 'Salespersons', icon: Users },
  { id: 'leads', label: 'Leads', icon: UserCheck },
  { id: 'samples', label: 'Samples', icon: FlaskConical },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'orders', label: 'Orders', icon: Box },
  { id: 'collections', label: 'Collections', icon: Wallet },
  { id: 'customers', label: 'Customers', icon: Building },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'replacements', label: 'Replacements', icon: RefreshCw },
];

export default function FinanceSalesAnalyticsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSalespersonId, setSelectedSalespersonId] = useState(null);

  // Filters State
  const [datePreset, setDatePreset] = useState('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [sortBy, setSortBy] = useState('confirmedSalesValue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // General Data State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [salespersons, setSalespersons] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [charts, setCharts] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  // Tab Specific Data
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabPagination, setTabPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const formatLakh = (val) => {
    if (val === null || val === undefined || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const queryParams = {
        datePreset,
        from: customFrom || undefined,
        to: customTo || undefined,
        salespersonId: salespersonFilter || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };

      const [sumSettled, spSettled, chartSettled, lbSettled] = await Promise.allSettled([
        financeSalesAnalyticsService.getSummary(queryParams),
        financeSalesAnalyticsService.getSalespersons(queryParams),
        financeSalesAnalyticsService.getCharts(queryParams),
        financeSalesAnalyticsService.getLeaderboards(queryParams),
      ]);

      const sumRes = sumSettled.status === 'fulfilled' ? sumSettled.value : null;
      const spRes = spSettled.status === 'fulfilled' ? spSettled.value : null;
      const chartRes = chartSettled.status === 'fulfilled' ? chartSettled.value : null;
      const lbRes = lbSettled.status === 'fulfilled' ? lbSettled.value : null;

      const summaryData = sumRes?.data?.summary || sumRes?.summary || sumRes?.data;
      if (summaryData) setSummary(summaryData);

      const salespersonsData = spRes?.data?.salespersons || spRes?.salespersons;
      if (salespersonsData) {
        setSalespersons(salespersonsData);
        setPagination(spRes?.data?.pagination || spRes?.pagination || { total: salespersonsData.length, page: 1, limit: 20 });
      }

      const chartsData = chartRes?.data || chartRes;
      if (chartsData) setCharts(chartsData);

      const leaderboardsData = lbRes?.data || lbRes;
      if (leaderboardsData) setLeaderboards(leaderboardsData);
      setRefreshedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    if (activeTab === 'overview' || activeTab === 'salespersons') return;
    setTabLoading(true);
    try {
      const queryParams = {
        datePreset,
        search: searchQuery || undefined,
        salespersonId: salespersonFilter || undefined,
        page,
        limit: 20,
      };

      let res = null;
      if (activeTab === 'leads') res = await financeSalesAnalyticsService.getLeads(queryParams);
      else if (activeTab === 'samples') res = await financeSalesAnalyticsService.getSamples(queryParams);
      else if (activeTab === 'quotations') res = await financeSalesAnalyticsService.getQuotations(queryParams);
      else if (activeTab === 'orders') res = await financeSalesAnalyticsService.getOrders(queryParams);
      else if (activeTab === 'collections') res = await financeSalesAnalyticsService.getCollections(queryParams);
      else if (activeTab === 'customers') res = await financeSalesAnalyticsService.getCustomers(queryParams);
      else if (activeTab === 'activities') res = await financeSalesAnalyticsService.getActivities(queryParams);
      else if (activeTab === 'complaints') res = await financeSalesAnalyticsService.getComplaints(queryParams);
      else if (activeTab === 'returns') res = await financeSalesAnalyticsService.getReturns(queryParams);
      else if (activeTab === 'replacements') res = await financeSalesAnalyticsService.getReplacements(queryParams);

      const listKey = Object.keys(res?.data || res || {}).find(k => k !== 'pagination') || activeTab;
      const list = res?.data?.[listKey] || res?.[listKey] || [];
      const pag = res?.data?.pagination || res?.pagination || { total: list.length, page: 1, limit: 20, totalPages: 1 };

      setTabData(list);
      setTabPagination(pag);
    } catch (err) {
      console.warn(`Failed to fetch ${activeTab} tab data:`, err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [datePreset, salespersonFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchTabData();
  }, [activeTab, datePreset, searchQuery, salespersonFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnalyticsData();
    fetchTabData();
  };

  const handleExportCsv = async () => {
    try {
      const res = await financeSalesAnalyticsService.getExportData({ datePreset });
      const rows = res.data?.rows || res.rows;
      if (!rows || rows.length === 0) return;

      const headers = Object.keys(rows[0]).join(',');
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows.map(r => Object.values(r).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Finance_Sales_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (selectedSalespersonId) {
    return (
      <FinanceSalespersonDetailView
        salespersonId={selectedSalespersonId}
        onBack={() => setSelectedSalespersonId(null)}
      />
    );
  }

  const s = summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: '#F0F9FF', borderRadius: '10px', color: '#0EA5E9' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Sales Analytics
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Complete read-only view of salesperson activity, pipeline, orders, revenue, collections and after-sales performance.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {refreshedAt && (
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>
              Refreshed: {refreshedAt}
            </span>
          )}

          <button
            onClick={() => { fetchAnalyticsData(); fetchTabData(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#0EA5E9',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(14,165,233,0.2)'
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global Filters Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '14px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
            <Filter size={16} color="#0EA5E9" />
            <span>Filters:</span>
          </div>

          <select
            value={datePreset}
            onChange={(e) => { setDatePreset(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              background: '#F8FAFC'
            }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_fy">This Financial Year</option>
          </select>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                width: '220px'
              }}
            />
          </form>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '3px solid #0EA5E9' : '3px solid transparent',
                background: isActive ? '#F0F9FF' : 'transparent',
                color: isActive ? '#0284C7' : '#64748B',
                fontWeight: isActive ? '700' : '600',
                fontSize: '13px',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top KPI Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #34D399' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Confirmed Sales</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{formatLakh(s.confirmedSalesValue)}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{s.totalSalesOrders || 0} Orders</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Collected Amount</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{formatLakh(s.totalCollectedAmount)}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Verified Dues</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Outstanding Dues</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{formatLakh(s.outstandingReceivable)}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Balance Dues</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #EF4444' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Overdue Dues</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>{formatLakh(s.overdueReceivable)}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Past Terms</div>
            </div>
          </div>

          {/* Top Salespersons Overview Table */}
          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Salesperson Performance</h3>
              <button
                onClick={() => setActiveTab('salespersons')}
                style={{ background: 'transparent', border: 'none', color: '#0EA5E9', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View All Salespersons</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Salesperson</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Leads</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Orders</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Sales Value</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Outstanding</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Efficiency</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salespersons.slice(0, 5).map((sp, idx) => (
                    <tr key={sp.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{sp.salesperson}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{sp.employeeId || sp.email}</div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{sp.totalLeads}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{sp.ordersGenerated}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#10B981' }}>{formatLakh(sp.confirmedSalesValue)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#3B82F6' }}>{formatLakh(sp.collectedAmount)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#F59E0B' }}>{formatLakh(sp.outstandingAmount)}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#8B5CF6' }}>{sp.collectionEfficiency}%</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => router.push(`/finance/sales/${sp.id}`)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                  {salespersons.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No salesperson records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Salespersons */}
      {activeTab === 'salespersons' && (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '16px' }}>All Salespersons Directory</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Salesperson</th>
                  <th style={{ padding: '10px 12px' }}>Team / Branch</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Leads</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Quotations</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Orders</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Confirmed Sales</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Outstanding</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Conversion</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {salespersons.map((sp, idx) => (
                  <tr key={sp.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{sp.salesperson}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{sp.employeeId || sp.email}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      <div>{sp.team}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{sp.branch}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{sp.totalLeads}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{sp.quotationsCreated}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{sp.ordersGenerated}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#10B981' }}>{formatLakh(sp.confirmedSalesValue)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#3B82F6' }}>{formatLakh(sp.collectedAmount)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#F59E0B' }}>{formatLakh(sp.outstandingAmount)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#8B5CF6' }}>{sp.collectionEfficiency}%</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => router.push(`/finance/sales/${sp.id}`)}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: '#0EA5E9', color: '#FFFFFF', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {salespersons.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No salespersons found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OTHER TABS: Generic Dynamic Table */}
      {activeTab !== 'overview' && activeTab !== 'salespersons' && (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>
              Sales {activeTab} Directory (Read-Only)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
              Total: {tabPagination.total || tabData.length} records
            </span>
          </div>

          {tabLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading {activeTab} data...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                    {tabData.length > 0 ? (
                      Object.keys(tabData[0]).map((head) => (
                        <th key={head} style={{ padding: '10px 12px' }}>
                          {head.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))
                    ) : (
                      <th style={{ padding: '10px 12px' }}>Details</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tabData.map((row, idx) => (
                    <tr key={row.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {Object.entries(row).map(([k, v]) => (
                        <td key={k} style={{ padding: '12px', color: '#334155' }}>
                          {typeof v === 'number' && k.toLowerCase().includes('amount') ? (
                            <strong style={{ color: '#10B981' }}>{formatLakh(v)}</strong>
                          ) : (
                            String(v !== null && v !== undefined ? v : '—')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {tabData.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                        No {activeTab} records found for the selected filter period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
