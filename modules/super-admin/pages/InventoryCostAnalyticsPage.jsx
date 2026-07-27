import React from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import "../components/dashboard.css";

export default function InventoryCostAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);
  const pur = fin.purchaseAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      {/* Page Header */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #dfe6ee)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgb(15 23 42 / 5%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0f2742', color: '#3BAEEB', display: 'grid', placeItems: 'center' }}>
            <Lucide.Database size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#24345C' }}>Purchase & Procurement Cost Analytics</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
              Material procurement expenses, PO commitments, vendor payments, and procurement price variance
            </p>
          </div>
        </div>
      </div>

      {/* Shared Super Admin Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Inventory & Procurement Filter Control"
        showBranch={true}
        showVendor={true}
        showProduct={true}
        showCategory={true}
      />

      {/* Procurement KPI Summary */}
      <div className="sa-cost-grid">
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Total PO Commitment Value</span>
            <Lucide.FileText size={18} color="#2563eb" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(pur.totalPOValue)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>POs Issued This Month</span>
              <strong>{pur.posIssuedThisMonth} POs</strong>
            </div>
          </div>
        </div>

        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Vendor Paid Amount</span>
            <Lucide.CheckCircle size={18} color="#10b981" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(pur.amountPaidToVendors)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Outstanding Dues</span>
              <strong style={{ color: '#ef4444' }}>{formatCurrency(pur.outstandingVendorPayments)}</strong>
            </div>
          </div>
        </div>

        <div className="sa-cost-card" style={{ gridColumn: 'span 2' }}>
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Vendor Returns & Credits</span>
            <Lucide.RefreshCw size={18} color="#8b5cf6" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '10px', border: '1px solid #DCE5F0' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 700, display: 'block' }}>MATERIAL RETURNED</span>
              <strong style={{ fontSize: '18px', color: '#2563eb' }}>{formatCurrency(fin.vendorReturnVal)}</strong>
            </div>
            <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '10px', border: '1px solid #DCE5F0' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 700, display: 'block' }}>CREDIT EXPECTED</span>
              <strong style={{ fontSize: '18px', color: '#10b981' }}>₹1.20 L</strong>
            </div>
            <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '10px', border: '1px solid #DCE5F0' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 700, display: 'block' }}>REPLACEMENT PENDING</span>
              <strong style={{ fontSize: '18px', color: '#f59e0b' }}>2 Batches</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Price Variance Table */}
      <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #dfe6ee)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 7px rgb(15 23 42 / 5%)' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', fontWeight: 750, color: '#24345C' }}>Purchase Price Variance (Procurement Cost Shifts)</h3>
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Raw Material Item</th>
                <th>Previous Price</th>
                <th>Current Price</th>
                <th>Unit</th>
                <th>Price Increase %</th>
                <th>Cost Impact</th>
              </tr>
            </thead>
            <tbody>
              {pur.priceVarianceItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{item.material}</td>
                  <td style={{ color: '#5E6B82' }}>₹{formatNumber(item.prevPrice)}</td>
                  <td style={{ fontWeight: 750, color: '#24345C' }}>₹{formatNumber(item.currPrice)}</td>
                  <td style={{ color: '#5E6B82' }}>/ {item.unit}</td>
                  <td style={{ fontWeight: 800, color: '#ef4444' }}>+{item.changePercent}%</td>
                  <td>
                    <span className={`dashboard-badge ${item.impact === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                      {item.impact} Impact
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
