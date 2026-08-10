/**
 * Centralized API client for Himalaya ERP.
 * Integrates caching, queue priority, and unified interceptors.
 */

import { requestInterceptor, responseInterceptor } from './interceptors';
import { apiCache } from './cache';
import { requestQueue } from './requestQueue';

const BASE_URL = '/api';

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath.startsWith('/api/')) {
    return normalizedPath;
  }

  return `/api${normalizedPath}`;
}

async function performRequest(method, path, body = null, options = {}) {
  const url = buildApiUrl(path);
  const isFormData = body instanceof FormData;
  const requestOptions = requestInterceptor({
    method,
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
    isFormData,
    ...options
  });

  const workspaceId = requestOptions.headers['X-Workspace-Id'] || 'N/A';
  const correlationId = requestOptions.headers['X-Correlation-Id'] || 'N/A';
  const cacheStatus = options.cacheKey ? 'MISS' : 'BYPASS';

  const startTime = Date.now();
  const fetchTask = async () => {
    try {
      // Local Mock for Reminders
      if (path.includes('/sales/reminders')) {
        const LS_KEY = 'erp_reminders';
        let items = [];
        try { 
          if (typeof window !== 'undefined') {
            items = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); 
          }
        } catch(e) {}
        
        if (method === 'GET') {
          return { data: items, success: true };
        }
        if (method === 'POST') {
          const bodyData = body instanceof FormData ? Object.fromEntries(body.entries()) : (typeof body === 'string' ? JSON.parse(body) : body);
          const newItem = { id: `REM-${Date.now()}`, ...bodyData, status: 'Pending', createdAt: new Date().toISOString() };
          items.push(newItem);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LS_KEY, JSON.stringify(items));
            window.dispatchEvent(new Event('storage'));
          }
          return { data: newItem, success: true };
        }
        if (method === 'PUT') {
           const id = path.split('/').pop();
           const idx = items.findIndex(i => i.id === id);
           const bodyData = body instanceof FormData ? Object.fromEntries(body.entries()) : (typeof body === 'string' ? JSON.parse(body) : body);
           let itemToReturn;
           if (idx > -1) {
             items[idx] = { ...items[idx], ...bodyData, updatedAt: new Date().toISOString() };
             itemToReturn = items[idx];
           } else {
             itemToReturn = { id, ...bodyData, updatedAt: new Date().toISOString() };
             items.push(itemToReturn);
           }
           if (typeof window !== 'undefined') {
             localStorage.setItem(LS_KEY, JSON.stringify(items));
             window.dispatchEvent(new Event('storage'));
           }
           return { data: itemToReturn, success: true };
        }
        if (method === 'PATCH' && path.endsWith('/complete')) {
           const match = path.match(/\/sales\/reminders\/(.+)\/complete/);
           const targetId = match ? match[1] : path.split('/').slice(-2)[0];
           const idx = items.findIndex(i => i.id === targetId || i.id?.toString() === targetId || i.reminderId === targetId);
           let itemToReturn;
           if (idx > -1) {
             items[idx] = { ...items[idx], status: 'Completed', completedAt: new Date().toISOString() };
             itemToReturn = items[idx];
           } else {
             itemToReturn = { id: targetId, status: 'Completed', completedAt: new Date().toISOString() };
             items.push(itemToReturn);
           }
           if (typeof window !== 'undefined') {
             localStorage.setItem(LS_KEY, JSON.stringify(items));
             window.dispatchEvent(new Event('storage'));
           }
           return { data: itemToReturn, success: true };
        }
        if (method === 'DELETE') {
           const id = path.split('/').pop();
           items = items.filter(i => i.id !== id);
           if (typeof window !== 'undefined') {
             localStorage.setItem(LS_KEY, JSON.stringify(items));
             window.dispatchEvent(new Event('storage'));
           }
           return { success: true };
        }
      }

      const res = await fetch(url, requestOptions);
      const data = await responseInterceptor(res, options);

      if (process.env.NODE_ENV !== 'production') {
        const duration = Date.now() - startTime;
        console.log(
          `%c[API] %c${method} %c${path} %c- ${res.status || 200} (${duration}ms) Workspace: ${workspaceId} Request: ${correlationId} Cache: ${cacheStatus}`,
          'color: #4CAF50; font-weight: bold;',
          'color: #2196F3; font-weight: bold;',
          'color: #9C27B0;',
          'color: #3F51B5; font-weight: bold;'
        );
      }
      return data;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const duration = Date.now() - startTime;
        console.error(
          `%c[API] %c${method} %c${path} %c- FAILED (${duration}ms) Workspace: ${workspaceId} Request: ${correlationId} Cache: ${cacheStatus} - ${err.message}`,
          'color: #F44336; font-weight: bold;',
          'color: #2196F3; font-weight: bold;',
          'color: #9C27B0;',
          'color: #FF5722; font-weight: bold;'
        );
      }
      throw err;
    }
  };

  // Run through request queue
  return requestQueue.add(fetchTask, options.priority || 'MEDIUM');
}

export const client = {
  get: async (path, options = {}) => {
    // Attempt cache read for GET requests if caching is enabled
    if (options.cacheKey) {
      const cachedData = apiCache.get(options.cacheKey);
      if (cachedData !== null) {
        if (process.env.NODE_ENV !== 'production') {
          const storedUser = localStorage.getItem('erpUser');
          let workspaceId = 'N/A';
          try {
            workspaceId = storedUser ? JSON.parse(storedUser)?.workspace_id : 'N/A';
          } catch { }
          console.log(
            `%c[API] %cGET %c${path} %c- 200 (0ms) Workspace: ${workspaceId} Cache: HIT`,
            'color: #4CAF50; font-weight: bold;',
            'color: #2196F3; font-weight: bold;',
            'color: #9C27B0;',
            'color: #009688; font-weight: bold;'
          );
        }
        return cachedData;
      }
    }

    const data = await performRequest('GET', path, null, options);

    if (options.cacheKey) {
      apiCache.set(options.cacheKey, data);
    }
    return data;
  },

  post: (path, body, options = {}) => performRequest('POST', path, body, options),
  put: (path, body, options = {}) => performRequest('PUT', path, body, options),
  patch: (path, body, options = {}) => performRequest('PATCH', path, body, options),
  delete: (path, options = {}) => performRequest('DELETE', path, null, options)
};