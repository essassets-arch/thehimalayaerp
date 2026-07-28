import React from 'react';
import ExecutiveKPIs from '../components/sales-analytics/analytics/ExecutiveKPIs.jsx';
import RevenueCharts from '../components/sales-analytics/analytics/RevenueCharts.jsx';
import LeadFunnel from '../components/sales-analytics/analytics/LeadFunnel.jsx';
import ProductAnalytics from '../components/sales-analytics/analytics/ProductAnalytics.jsx';
import RegionalAnalytics from '../components/sales-analytics/analytics/RegionalAnalytics.jsx';
import PaymentAnalytics from '../components/sales-analytics/analytics/PaymentAnalytics.jsx';
import Leaderboards from '../components/sales-analytics/analytics/Leaderboards.jsx';
import OrderAnalytics from '../components/sales-analytics/analytics/OrderAnalytics.jsx';
import HeatMap from '../components/sales-analytics/analytics/HeatMap.jsx';

// Section wrapper for each analytics group
const Section = ({ title, children }) => (
  <section style={{ marginBottom: '36px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid var(--color-border)' }}>
      <div style={{ width: '4px', height: '20px', background: 'linear-gradient(to bottom, #337a86, #0284c7)', borderRadius: '2px' }} />
      <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>{title}</h2>
    </div>
    {children}
  </section>
);

const AnalyticsTab = () => (
  <div style={{ animation: 'fadeIn 0.25s ease' }}>
    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

    <Section title="📊 Executive KPIs">
      <ExecutiveKPIs />
    </Section>

    <Section title="💰 Revenue Analysis">
      <RevenueCharts />
    </Section>

    <Section title="🛒 Order Analytics">
      <OrderAnalytics />
    </Section>

    <Section title="🎯 Lead Pipeline Funnel">
      <LeadFunnel />
    </Section>

    <Section title="📦 Product & Category Analytics">
      <ProductAnalytics />
    </Section>

    <Section title="🗺️ Regional Performance">
      <RegionalAnalytics />
    </Section>

    <Section title="💳 Payment & Receivables">
      <PaymentAnalytics />
    </Section>

    <Section title="🏆 Performance Leaderboards">
      <Leaderboards />
    </Section>

    <Section title="🌡️ Activity Heatmap">
      <HeatMap />
    </Section>
  </div>
);

export default AnalyticsTab;
