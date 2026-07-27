import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import KPI from '../shared/KPI.jsx';
import { mockKPIData } from '../../../services/salesAnalytics.service.js';
import { TrendingUp, ShoppingCart, Target, Users, Award, BarChart2, DollarSign, Clock } from 'lucide-react';

const ExecutiveKPIs = () => {
  const { filters, kpiData } = useContext(SalesAnalyticsContext);
  const data = kpiData || mockKPIData(filters);

  return (
    <div>
      <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '20px', fontWeight: '600' }}>
        Key Performance Indicators — Real-time snapshot across Revenue, Orders, Leads, and Customers.
      </p>

      {/* Revenue KPIs */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--color-border)' }}>
          💰 Revenue
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          <KPI title="Total Revenue" value={data.totalRevenue} suffix=" Cr" prefix="₹" trend={data.revenueTrend} trendLabel="vs last period" icon={<DollarSign size={16} />} color="#16a34a" />
          <KPI title="Avg Order Value" value={data.avgOrderValue} prefix="₹" suffix="K" trend={data.aovTrend} trendLabel="vs last period" icon={<TrendingUp size={16} />} color="#0284c7" />
          <KPI title="Revenue / Day" value={data.revenuePerDay} prefix="₹" suffix="L" trend={data.revenuePerDayTrend} icon={<BarChart2 size={16} />} color="#8b5cf6" />
          <KPI title="Pending Payments" value={data.pendingPayments} prefix="₹" suffix="L" trend={-3} trendLabel="outstanding" icon={<Clock size={16} />} color="#ef4444" />
        </div>
      </div>

      {/* Order KPIs */}
      <div style={{ marginBottom: '8px', marginTop: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--color-border)' }}>
          🛒 Orders
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          <KPI title="Total Orders" value={data.totalOrders} trend={data.ordersTrend} trendLabel="this period" icon={<ShoppingCart size={16} />} color="#4f46e5" />
          <KPI title="Delivered" value={data.deliveredOrders} trend={data.deliveryRate} trendLabel="delivery rate" icon={<Award size={16} />} color="#16a34a" />
          <KPI title="In Production" value={data.inProduction} trend={0} trendLabel="active" icon={<BarChart2 size={16} />} color="#f59e0b" />
          <KPI title="Cancelled / Rejected" value={data.cancelledOrders} trend={data.cancelRate} trendLabel="cancel rate" icon={<Target size={16} />} color="#ef4444" />
        </div>
      </div>

      {/* Lead KPIs */}
      <div style={{ marginBottom: '8px', marginTop: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--color-border)' }}>
          🎯 Lead Pipeline
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          <KPI title="Leads Created" value={data.leadsCreated} trend={data.leadsTrend} trendLabel="this period" icon={<Target size={16} />} color="#0284c7" />
          <KPI title="Qualified Leads" value={data.qualifiedLeads} trend={data.qualifyRate} trendLabel="qualify rate" icon={<TrendingUp size={16} />} color="#4f46e5" />
          <KPI title="Lead → Order Conv." value={data.leadConvRate} suffix="%" trend={data.convRateTrend} trendLabel="conversion" icon={<Award size={16} />} color="#16a34a" />
          <KPI title="Avg Lead Cycle" value={data.avgLeadCycle} suffix=" days" trend={-1.2} trendLabel="vs last period" icon={<Clock size={16} />} color="#8b5cf6" />
        </div>
      </div>

      {/* Customer KPIs */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--color-border)' }}>
          🏢 Customers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          <KPI title="Total Customers" value={data.totalCustomers} trend={data.custGrowth} trendLabel="growth" icon={<Users size={16} />} color="#ea580c" />
          <KPI title="Repeat Customers" value={data.repeatCustomers} trend={data.repeatRate} trendLabel="retention" icon={<Award size={16} />} color="#16a34a" />
          <KPI title="New This Period" value={data.newCustomers} trend={data.newCustTrend} trendLabel="vs last" icon={<TrendingUp size={16} />} color="#0284c7" />
          <KPI title="Avg. LTV" value={data.avgLTV} prefix="₹" suffix="L" trend={data.ltvTrend} trendLabel="lifetime value" icon={<DollarSign size={16} />} color="#8b5cf6" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExecutiveKPIs);
