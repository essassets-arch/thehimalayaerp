import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../api/client';

/**
 * useProductCatalog — TanStack-style catalog cache hook.
 *
 * Returns:
 *  catalog        — { categories, products, grouped } (full catalog)
 *  loading        — boolean
 *  error          — error string or null
 *  searchProducts — async function (query, categoryId?, dispatchCat?) → products[]
 *  getProductById — (id) → product | undefined
 *  getCategories  — () → categories[]
 *  refetch        — force reload catalog
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _catalog = null;
let _fetchedAt = null;

export function useProductCatalog() {
  const [catalog, setCatalog] = useState(_catalog);
  const [loading, setLoading] = useState(!_catalog);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchCatalog = useCallback(async (force = false) => {
    const now = Date.now();
    // Return cached if still fresh
    if (!force && _catalog && _fetchedAt && (now - _fetchedAt) < CACHE_TTL_MS) {
      setCatalog(_catalog);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await client.get('/products/catalog');
      if (data) {
        _catalog = data;
        _fetchedAt = Date.now();
        if (isMounted.current) {
          setCatalog(data);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.message || err.message || 'Failed to load product catalog');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchCatalog();
    return () => { isMounted.current = false; };
  }, [fetchCatalog]);

  const searchProducts = useCallback(async (query = '', categoryId = null, dispatchCat = null) => {
    try {
      const params = new URLSearchParams({ q: query });
      if (categoryId) params.set('category', categoryId);
      if (dispatchCat) params.set('dispatch', dispatchCat);
      const data = await client.get(`/products/search?${params}`);
      return data || [];
    } catch {
      return [];
    }
  }, []);

  const getProductById = useCallback((id) => {
    if (!catalog?.products) return undefined;
    return catalog.products.find((p) => p.id === id || String(p.id) === String(id));
  }, [catalog]);

  const getCategories = useCallback(() => {
    return catalog?.categories || [];
  }, [catalog]);

  return {
    catalog,
    loading,
    error,
    searchProducts,
    getProductById,
    getCategories,
    refetch: () => fetchCatalog(true),
  };
}
