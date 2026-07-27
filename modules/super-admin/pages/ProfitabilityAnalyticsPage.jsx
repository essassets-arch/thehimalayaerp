'use client';

import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import "../components/dashboard.css";

export default function ProfitabilityAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);
  const [profitFilter, setProfitFilter] = useState('All');

  const filteredOrderProfitability = fin.orderProfitability.filter(item => {
    if (profitFilter === 'All') return true;
    if (profitFilter === 'Most Profitable') return item.margin >= 30;
    if (profitFilter === 'Loss-Making') return item.margin < 0 || item.grossProfit < 0;
    if (profitFilter === 'High Transport') return item.category === 'High Transport';
    if (profitFilter === 'High Rework') return item.category === 'High Rework';
    return true;
  });

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
            <Lucide.DollarSign size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#24345C' }}>Business Profitability Control</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
              Order-level, product-level, and customer-level profit margins and cost contribution
            </p>
          </div>
        </div>
      </div>

      {/* Shared Super Admin Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Profitability Control Filter"
        showBranch={true}
        showCustomer={true}
        showProduct={true}
        showCategory={true}
      />

      {/* Order-Wise Profitability */}
      <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #dfe6ee)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 7px rgb(15 23 42 / 5%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#24345C' }}>Order-Wise Profitability</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#5E6B82' }}>Direct cost & margin breakdown per delivered order</p>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Most Profitable', 'Loss-Making', 'High Transport', 'High Rework'].map(tab => (
              <button
                key={tab}
                onClick={() => setProfitFilter(tab)}
                className={`dashboard-filter-button ${profitFilter === tab ? 'is-active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="sa-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="sa-table responsive-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Sales Value</th>
                <th>Material Cost</th>
                <th>Production Cost</th>
                <th>Rework/Scrap</th>
                <th>Dispatch Cost</th>
                <th>Total Cost</th>
                <th>Gross Profit</th>
                <th>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrderProfitability.map((ord, idx) => (
                <tr key={idx}>
                  <td data-label="Order ID" style={{ fontWeight: 750, color: '#2563eb' }}>{ord.id}</td>
                  <td data-label="Customer" style={{ fontWeight: 700, color: '#24345C' }}>{ord.cust}</td>
                  <td data-label="Product" style={{ color: '#475569', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.prod}</td>
                  <td data-label="Qty" style={{ fontWeight: 650 }}>{ord.qty}</td>
                  <td data-label="Sales Value" style={{ fontWeight: 750, color: '#24345C' }}>₹{formatNumber(ord.sales)}</td>
                  <td data-label="Material Cost" style={{ color: '#475569' }}>₹{formatNumber(ord.materialCost)}</td>
                  <td data-label="Production Cost" style={{ color: '#475569' }}>₹{formatNumber(ord.prodCost)}</td>
                  <td data-label="Rework/Scrap" style={{ color: ord.reworkCost > 5000 ? '#ef4444' : '#475569', fontWeight: ord.reworkCost > 5000 ? 700 : 400 }}>₹{formatNumber(ord.reworkCost)}</td>
                  <td data-label="Dispatch Cost" style={{ color: '#475569' }}>₹{formatNumber(ord.dispatchCost)}</td>
                  <td data-label="Total Cost" style={{ fontWeight: 700, color: '#24345C' }}>₹{formatNumber(ord.totalCost)}</td>
                  <td data-label="Gross Profit" style={{ fontWeight: 800, color: ord.grossProfit < 0 ? '#ef4444' : '#10b981' }}>
                    ₹{formatNumber(ord.grossProfit)}
                  </td>
                  <td data-label="Margin %">
                    <span className={`dashboard-badge ${ord.margin < 0 ? 'badge-danger' : ord.margin >= 30 ? 'badge-success' : 'badge-warning'}`}>
                      {formatPercent(ord.margin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product & Customer Profitability Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Product Profitability */}
        <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #dfe6ee)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 7px rgb(15 23 42 / 5%)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 750, color: '#24345C' }}>Product Profitability Summary</h3>
          <div className="sa-table-container">
            <table className="sa-table" style={{ minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Avg Cost</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {fin.productProfitability.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#24345C' }}>{p.product}</td>
                    <td style={{ fontWeight: 650 }}>{p.sold}</td>
                    <td style={{ fontWeight: 750, color: '#2563eb' }}>{formatCurrency(p.revenue)}</td>
                    <td style={{ color: '#5E6B82' }}>₹{formatNumber(p.avgProdCost + p.avgMatCost + p.avgDispatchCost)}</td>
                    <td>
                      <span className={`dashboard-badge ${p.margin >= 30 ? 'badge-success' : 'badge-warning'}`}>
                        {formatPercent(p.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Profitability */}
        <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #dfe6ee)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 7px rgb(15 23 42 / 5%)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 750, color: '#24345C' }}>Customer Profitability Summary</h3>
          <div className="sa-table-container">
            <table className="sa-table" style={{ minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Customer Partner</th>
                  <th>Sales</th>
                  <th>Collected</th>
                  <th>Profit</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {fin.customerProfitability.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#24345C' }}>{c.name}</td>
                    <td style={{ fontWeight: 750, color: '#24345C' }}>{formatCurrency(c.totalSales)}</td>
                    <td style={{ color: '#10b981', fontWeight: 650 }}>{formatCurrency(c.collected)}</td>
                    <td style={{ fontWeight: 750, color: '#2563eb' }}>{formatCurrency(c.grossProfit)}</td>
                    <td>
                      <span className={`dashboard-badge ${c.margin >= 30 ? 'badge-success' : 'badge-warning'}`}>
                        {formatPercent(c.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
