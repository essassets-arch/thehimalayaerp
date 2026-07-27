import { useState, useEffect } from 'react';

export const PRESETS = {
  TODAY: { period: 'today', region: 'All Regions', category: 'All Categories', employee: 'All Employees' },
  WEEK: { period: 'this_week', region: 'All Regions', category: 'All Categories', employee: 'All Employees' },
  MONTH: { period: 'this_month', region: 'All Regions', category: 'All Categories', employee: 'All Employees' },
  QUARTER: { period: 'this_quarter', region: 'All Regions', category: 'All Categories', employee: 'All Employees' },
  YEAR: { period: 'this_year', region: 'All Regions', category: 'All Categories', employee: 'All Employees' },
  COLLECTIONS: { period: 'this_month', region: 'All Regions', category: 'All Categories', employee: 'All Employees', payment_status: 'Outstanding' },
  CRM: { period: 'this_month', region: 'All Regions', category: 'All Categories', employee: 'All Employees', order_status: 'Pending' }
};

export const useSalesFilters = () => {
  const [filters, setFilters] = useState({
    period: 'this_month',
    region: 'All Regions',
    category: 'All Categories',
    employee: 'All Employees',
    dateFrom: '',
    dateTo: '',
    company_id: '',
    branch: '',
    sales_executive_id: '',
    customer_id: '',
    state: '',
    city: '',
    priority: '',
    order_status: '',
    payment_status: ''
  });

  const [savedViews, setSavedViews] = useState([]);

  useEffect(() => {
    const views = localStorage.getItem('bi_saved_views');
    if (views) {
      try { setSavedViews(JSON.parse(views)); } catch (e) {}
    }
  }, []);

  const saveCurrentView = (name) => {
    const newView = { id: Date.now(), name, filters };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem('bi_saved_views', JSON.stringify(updated));
  };

  const deleteSavedView = (id) => {
    const updated = savedViews.filter(v => v.id !== id);
    setSavedViews(updated);
    localStorage.setItem('bi_saved_views', JSON.stringify(updated));
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFilters(prev => ({ ...prev, ...preset }));
    }
  };

  return {
    filters,
    setFilters,
    savedViews,
    saveCurrentView,
    deleteSavedView,
    applyPreset
  };
};
