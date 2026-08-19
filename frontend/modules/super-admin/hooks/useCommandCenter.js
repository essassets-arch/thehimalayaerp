import { useState, useEffect, useCallback } from 'react';
import { backendFetch } from '../../../lib/backendFetch';
import { formatCurrency } from '../utils/financialCalculations';

// The command centre is intentionally a thin API client: all business
// calculations, ownership matching and database filtering happen in NestJS.
export const useCommandCenter = (filters = {}, activeDates = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeDates?.dateFrom) params.set('from', activeDates.dateFrom);
      if (activeDates?.dateTo) params.set('to', activeDates.dateTo);
      const filterMap = { branch: 'branchId', customer: 'customerId', product: 'productId', category: 'categoryId', salesperson: 'salespersonId', status: 'status' };
      Object.entries(filterMap).forEach(([key, apiKey]) => {
        if (filters[key] && filters[key] !== 'All') params.set(apiKey, filters[key]);
      });
      const payload = await backendFetch(`/api/backend/super-admin/executive-command-center?${params}`, { cacheTtlMs: 0 });
      setData(payload);
    } catch (requestError) {
      setData(null);
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [filters, activeDates?.dateFrom, activeDates?.dateTo]);

  useEffect(() => { load(); }, [load]);

  if (!data?.kpis || !data?.charts || !Array.isArray(data?.executives)) {
    return {
      data: null,
      loading,
      error: error || new Error('Executive Command Center returned an incomplete response.'),
      refreshAll: load
    };
  }
  const toLegacyKpi = (title, metric, suffix = '') => {
    const hasChange = metric.changePercent !== 0 || (metric.previousValue !== undefined && metric.previousValue > 0);
    return {
      title,
      value: suffix === '%' ? `${metric.value.toFixed(2)}%` : suffix ? `${metric.value} ${suffix}` : formatCurrency(metric.value),
      achievement: metric.achievementPercent !== null && metric.achievementPercent !== undefined ? metric.achievementPercent : null,
      change: hasChange ? `${metric.changePercent >= 0 ? '+' : ''}${metric.changePercent.toFixed(2)}%` : null
    };
  };
  const k = data.kpis;
  const legacyData = {
    ...data,
    overview: { kpis: [
      toLegacyKpi('Gross Sales Revenue', k.grossSalesRevenue), toLegacyKpi('Cash Collections', k.cashCollections),
      toLegacyKpi('Outstanding Receivables', k.outstandingReceivables), toLegacyKpi('Confirmed Orders', k.confirmedOrders, 'Orders'),
      toLegacyKpi('Avg Order Value', k.averageOrderValue), toLegacyKpi('Active CRM Leads', k.activeCrmLeads, 'Leads'),
      toLegacyKpi('Lead Conversion Rate', k.leadConversionRate, '%'), toLegacyKpi('Production Output Yield', k.productionOutputYield, '%'),
      toLegacyKpi('QC Pass Rate', k.qcPassRate, '%'), toLegacyKpi('Dispatches Delivered', k.dispatchesDelivered, 'Loads'),
      toLegacyKpi('Active Enterprise Clients', k.activeEnterpriseClients, 'Clients'),
      toLegacyKpi('Quotation Conversion', k.quotationConversionRate, '%'), toLegacyKpi('Sample Fulfillment', k.sampleFulfillment, '%'),
      toLegacyKpi('On-Time Dispatch Rate', k.onTimeDispatchRate, '%')
    ] },
    health: Object.entries(data.healthIndexes).map(([name, item]) => ({ name, rating: item.score, severity: item.score >= 85 ? 'GREEN' : item.score >= 65 ? 'YELLOW' : 'RED' })),
    exceptions: { exceptions: data.criticalExceptions.map(item => ({ alert: `${item.customer}: ${formatCurrency(item.amount)} overdue by ${item.daysOverdue} days`, severity: item.severity.toLowerCase() })) },
    events: data.liveFeed.map(item => ({ type: item.type, details: item.details, time: new Date(item.occurredAt).toLocaleString() })),
    trends: data.charts.billingsReceipts.map(item => ({ month: item.period, revenue: item.billings, receipts: item.receipts })),
    crm: { splits: { sources: data.charts.leadSources } },
    production: { metrics: { planned_qty: data.charts.productionOutput.reduce((sum, item) => sum + item.planned, 0), produced_qty: data.charts.productionOutput.reduce((sum, item) => sum + item.produced, 0) } },
    employees: { performance: data.executives.map(item => ({ executive: item.name, email: item.email, leads: item.leadsBreakdown?.total ?? item.leads ?? 0, revenue: item.revenueGenerated, closed: item.orders.confirmed, targetRevenue: item.targetRevenue, achievementPercent: item.achievementPercent })) },
    finance: { billing: k.grossSalesRevenue.value, collected: k.cashCollections.value, outstanding: k.outstandingReceivables.value, agingBuckets: data.receivablesAgeing },
    explorer: { rows: data.transactions.map(item => ({ ...item, salesExecutive: item.salesperson, revenue: item.amount, paymentStatus: item.collected >= item.amount ? 'Paid' : 'Outstanding', deliveryStatus: item.dispatchStatus })) }
  };
  return { data: legacyData, loading, error, refreshAll: load };
};
