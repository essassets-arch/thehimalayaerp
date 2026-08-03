'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, Box, TrendingUp, AlertTriangle, ListOrdered, IndianRupee, Layers } from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import '@/components/erp-premium-ui.css';
import { toast } from 'sonner';

export default function StoreReportsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const COLORS = ['#0ea5e9', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchDashboard = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await backendFetch(`/api/backend/store-reports/dashboard?month=${month}&year=${year}`);
      setData(res);
    } catch (err) {
      toast.error('Failed to load store reports.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleExport = (type: string) => {
    const url = `/api/backend/store-reports/export/${type}?month=${month}&year=${year}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `store_report.${type === 'excel' ? 'csv' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`${type.toUpperCase()} Report Exported Successfully!`);
  };

  if (loading && !data) {
    return <div className="erp-page-container" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading Comprehensive Reports Dashboard...</div>;
  }

  const { summary, consumptionChart, stockChart, requestChart, purchaseChart, tables } = data || {};

  return (
    <div className="erp-page-container">
      {/* Header */}
      <div className="erp-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <FileSpreadsheet size={26} style={{ color: '#059669' }} />
            Store Reports Dashboard
          </h2>
          <p className="erp-header-subtitle">Unified view of inventory, requests, and purchases, generated directly by the backend.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(e.target.value)} className="erp-search-input" style={{ width: 120 }}>
            <option value="1">January</option><option value="2">February</option><option value="3">March</option>
            <option value="4">April</option><option value="5">May</option><option value="6">June</option>
            <option value="7">July</option><option value="8">August</option><option value="9">September</option>
            <option value="10">October</option><option value="11">November</option><option value="12">December</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="erp-search-input" style={{ width: 100 }}>
            <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
          </select>
          
          <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
            <button onClick={() => handleExport('pdf')} className="erp-btn erp-btn-secondary"><Download size={14}/> PDF</button>
            <button onClick={() => handleExport('excel')} className="erp-btn erp-btn-secondary"><Download size={14}/> Excel</button>
            <button onClick={() => window.print()} className="erp-btn erp-btn-secondary"><Printer size={14}/> Print</button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SummaryCard title="Total Raw Materials" value={summary?.totalMaterials || 0} icon={Layers} color="#0ea5e9" />
        <SummaryCard title="Current Stock Value" value={`₹ ${(summary?.stockValue || 0).toLocaleString()}`} icon={IndianRupee} color="#10b981" />
        <SummaryCard title="Materials Consumed" value={summary?.consumed || 0} icon={TrendingUp} color="#f59e0b" />
        <SummaryCard title="Purchase Amount" value={`₹ ${(summary?.purchaseAmount || 0).toLocaleString()}`} icon={ListOrdered} color="#8b5cf6" />
        <SummaryCard title="Pending Requests" value={summary?.pendingRequests || 0} icon={Box} color="#ec4899" />
        <SummaryCard title="Low Stock Items" value={summary?.lowStock || 0} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Consumption */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Monthly Material Consumption</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="consumed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Raw Material Stock by Category</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                  {stockChart?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Status */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Material Requests Status</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase Report */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Monthly Purchase Breakdown</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={purchaseChart} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={100} label>
                  {purchaseChart?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables Section */}
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginTop: '32px', marginBottom: '16px' }}>Detailed Data Tables</h2>

      <ReportTable title="1. Monthly Material Consumption" data={tables?.consumption} columns={[
        { key: 'material', label: 'Material' }, { key: 'openingStock', label: 'Opening Stock' }, { key: 'consumed', label: 'Consumed' }, { key: 'stock', label: 'Closing Stock' }, { key: 'unit', label: 'Unit' }, { key: 'rate', label: 'Cost (₹)' }
      ]} />

      <ReportTable title="2. Raw Material Stock" data={tables?.stock} columns={[
        { key: 'material', label: 'Material' }, { key: 'category', label: 'Category' }, { key: 'stock', label: 'Current Stock' }, { key: 'reorderLevel', label: 'Min Stock' }, { key: 'unit', label: 'Unit' },
        { key: 'status', label: 'Status', render: (val: any, row: any) => row.stock === 0 ? <span className="erp-badge erp-badge-red">Out of Stock</span> : row.stock <= row.reorderLevel ? <span className="erp-badge erp-badge-yellow">Low Stock</span> : <span className="erp-badge erp-badge-green">In Stock</span> }
      ]} />

      <ReportTable title="3. Material Requests" data={tables?.requests} columns={[
        { key: 'requestNo', label: 'Request No' }, { key: 'department', label: 'Department' }, { key: 'material', label: 'Material' }, { key: 'qty', label: 'Qty' }, { key: 'approvedQty', label: 'Approved Qty' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date', render: (val: any) => new Date(val).toLocaleDateString() }
      ]} />

      <ReportTable title="4. Purchase Report" data={tables?.purchases} columns={[
        { key: 'poNo', label: 'PO No' }, { key: 'vendor', label: 'Vendor' }, { key: 'material', label: 'Material' }, { key: 'qty', label: 'Qty' }, { key: 'amount', label: 'Amount (₹)' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date', render: (val: any) => new Date(val).toLocaleDateString() }
      ]} />

      <ReportTable title="5. Low Stock Materials" data={tables?.lowStock} columns={[
        { key: 'material', label: 'Material' }, { key: 'stock', label: 'Current Stock' }, { key: 'reorderLevel', label: 'Minimum Stock' }
      ]} />

    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="erp-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ background: `${color}15`, padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{value}</div>
      </div>
    </div>
  );
}

function ReportTable({ title, data, columns }: any) {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="erp-table-card" style={{ marginBottom: '24px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>{title}</h3>
      </div>
      <div className="erp-table-responsive">
        <table className="erp-table">
          <thead>
            <tr>{columns.map((c: any) => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i}>
                {columns.map((c: any) => (
                  <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
