import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../lib/apiClient';

export const useCommandCenter = (filters) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: null,
    exceptions: null,
    crm: null,
    production: null,
    dispatch: null,
    finance: null,
    employees: null,
    explorer: null,
    trends: null,
    health: null
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryStr = queryParams.toString();
      const domains = ['overview', 'exceptions', 'crm', 'production', 'dispatch', 'finance', 'employees', 'explorer', 'trends', 'health'];
      
      const responses = await Promise.all(
        domains.map(dom => 
          apiClient.get(`/reports/analytics/command-center/${dom}?${queryStr}`)
            .then(res => res?.data || res)
            .catch(err => {
              console.error(`Error loading command center domain [${dom}]:`, err);
              return null;
            })
        )
      );

      const updated = {};
      domains.forEach((dom, idx) => {
        updated[dom] = responses[idx];
      });

      setData(updated);
    } catch (err) {
      console.error('Failed to load command center domains:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    data,
    loading,
    refreshAll: loadAll
  };
};
