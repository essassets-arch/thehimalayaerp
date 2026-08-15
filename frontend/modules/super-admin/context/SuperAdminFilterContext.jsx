import React, { createContext, useContext, useState } from 'react';
import { calculatePeriodDates } from '../utils/financialCalculations';

const SuperAdminFilterContext = createContext(null);

const initialFilters = {
  branch: 'All',
  customer: 'All',
  vendor: 'All',
  product: 'All',
  department: 'All',
  salesperson: 'All',
  status: 'All',
  category: 'All',
  shift: 'All',
  salaryMonth: 'July 2026',
  order: 'All'
};

export function SuperAdminFilterProvider({ children }) {
  const [period, setPeriodState] = useState('This Month');
  const initialDates = calculatePeriodDates('This Month');
  const [startDate, setStartDate] = useState(initialDates.dateFrom);
  const [endDate, setEndDate] = useState(initialDates.dateTo);
  const [filters, setFilters] = useState(initialFilters);

  const activeDates = calculatePeriodDates(period, startDate, endDate);

  const setPeriod = (newPeriod) => {
    setPeriodState(newPeriod);
    if (newPeriod !== 'Custom Date Range') {
      const dates = calculatePeriodDates(newPeriod);
      setStartDate(dates.dateFrom);
      setEndDate(dates.dateTo);
    }
  };

  const setCustomDates = (start, end) => {
    if (!start || !end) return;
    if (new Date(start) > new Date(end)) return;
    setStartDate(start);
    setEndDate(end);
    setPeriodState('Custom Date Range');
  };

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const clearAllFilters = () => {
    setPeriodState('This Month');
    const defaultDates = calculatePeriodDates('This Month');
    setStartDate(defaultDates.dateFrom);
    setEndDate(defaultDates.dateTo);
    setFilters(initialFilters);
  };

  return (
    <SuperAdminFilterContext.Provider
      value={{
        period,
        startDate,
        endDate,
        activeDates,
        filters,
        setPeriod,
        setCustomDates,
        setFilter,
        clearAllFilters
      }}
    >
      {children}
    </SuperAdminFilterContext.Provider>
  );
}

export function useSuperAdminFilter() {
  const ctx = useContext(SuperAdminFilterContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    const activeDates = calculatePeriodDates('This Month');
    return {
      period: 'This Month',
      startDate: activeDates.dateFrom,
      endDate: activeDates.dateTo,
      activeDates,
      filters: initialFilters,
      setPeriod: () => {},
      setCustomDates: () => {},
      setFilter: () => {},
      clearAllFilters: () => {}
    };
  }
  return ctx;
}
